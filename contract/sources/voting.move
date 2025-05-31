module voting_addr::Voting {
    use std::vector;
    use aptos_std::table::{Self, Table};
    use aptos_framework::signer;
    use aptos_framework::timestamp;

    const EDEADLINE_PASSED: u64 = 0;
    const EPROPOSAL_ENDED: u64 = 1;
    const EALREADY_VOTED: u64 = 2;
    const ENOT_ENOUGH_OPTION: u64 = 3;
    const ENO_TITLE: u64 = 4;
    const ENO_DESCRIPTION: u64 = 5;
    const EPROPOSAL_ID_NOT_FOUND: u64 = 6;
    const EINVALID_PROPOSAL_TYPE: u64 = 7;

    enum ProposalType has store, copy, drop {
        General,
        Election,
    }

    struct Option has key, store, copy, drop {
        id: u64,
        name: vector<u8>,
    }

    struct Proposal has key, store {
        id: u64,
        creator: address,
        title: vector<u8>,
        description: vector<u8>,
        proposal_type: ProposalType,
        options: vector<Option>,
        votes: Table<u64, u64>, // id => count
        voters: Table<address, bool>,
        deadline: u64,
        executed: bool,
    }

    struct ProposalStore has key{
        proposals: Table<u64, Proposal>,
        next_id: u64,
    }

    fun init_module(account: &signer) {
        let store = ProposalStore {
            proposals: table::new<u64, Proposal>(),
            next_id: 0,
        };
        move_to(account, store);
    }

    public entry fun create_proposal(
        creator: &signer,
        title: vector<u8>,
        description: vector<u8>,
        proposal_type_u8: u8,
        options: vector<vector<u8>>,
        deadline: u64,
    ) acquires ProposalStore {
        assert!(deadline > timestamp::now_seconds(), EDEADLINE_PASSED);
        assert!(vector::length(&options) > 0, ENOT_ENOUGH_OPTION);
        assert!(vector::length(&title) > 0, ENO_TITLE);
        assert!(vector::length(&description) > 0, ENO_DESCRIPTION);

        // Convert u8 to ProposalType enum
        let proposal_type: ProposalType;
        if (proposal_type_u8 == 0) {
            proposal_type = ProposalType::General;
        } else if (proposal_type_u8 == 1) {
            proposal_type = ProposalType::Election;
        } else {
            abort EINVALID_PROPOSAL_TYPE;
        };


        let signer_address = signer::address_of(creator);
        let store = borrow_global_mut<ProposalStore>(@voting_addr);
        let id = store.next_id;

        let vote_table = table::new<u64, u64>();
        let voter_table = table::new<address, bool>();
        let option_with_ids = vector::empty<Option>();

        let i = 0;
        while (i < vector::length(&options)) {
            let option = Option {
                id: i,
                name: *vector::borrow(&options, i)
            };
            vector::push_back(&mut option_with_ids, option);
            table::add(&mut vote_table, i, 0);
            i = i + 1;
        };

        let proposal = Proposal {
            id,
            creator: signer_address,
            title,
            description,
            proposal_type,
            options: option_with_ids,
            votes: vote_table,
            voters: voter_table,
            deadline,
            executed: false,
        };

        table::add(&mut store.proposals, id, proposal);
        store.next_id = store.next_id + 1;
    }

    public entry fun vote(
        voter: &signer,
        proposal_id: u64,
        option_id: u64,
    ) acquires ProposalStore {
        let addr = signer::address_of(voter);
        let store = borrow_global_mut<ProposalStore>(@voting_addr);
        let proposal = table::borrow_mut(&mut store.proposals, proposal_id);
        assert!(timestamp::now_seconds() < proposal.deadline, EPROPOSAL_ENDED);

        let has_voted = table::contains(&proposal.voters, addr);
        assert!(!has_voted, EALREADY_VOTED);

        let count = table::borrow_mut(&mut proposal.votes, option_id);
        *count = *count + 1;

        table::add(&mut proposal.voters, addr, true);
    }

    //getter function

    public fun get_vote_count_per_candidate(
        account: address,
        proposal_id: u64,
        option_id: u64
    ): u64 acquires ProposalStore {
        let store = borrow_global<ProposalStore>(@voting_addr);
        let proposal = table::borrow(&store.proposals, proposal_id);
        *table::borrow(&proposal.votes, option_id)
    }


    public fun get_proposal_count(account: address): u64 acquires ProposalStore {
        let store = borrow_global<ProposalStore>(account);
        store.next_id
    }

    public fun get_proposal_info(
        account: address,
        proposal_id: u64
    ): (u64, address, vector<u8>, vector<u8>, ProposalType, vector<Option>, u64, bool) 
    acquires ProposalStore {
        let store = borrow_global<ProposalStore>(account);
        let proposal = table::borrow(&store.proposals, proposal_id);
        let option_copy = *&proposal.options;
        
        (
            proposal.id,
            proposal.creator,
            proposal.title,
            proposal.description,
            proposal.proposal_type,
            option_copy,
            proposal.deadline,
            proposal.executed
        )
    }

    public fun get_proposal_total_votes(
        account: address,
        proposal_id: u64
    ):u64 acquires ProposalStore{
        let store = borrow_global<ProposalStore>(account);
        let proposal = table::borrow(&store.proposals, proposal_id);
        let total_votes: u64 = 0;
        let options = &proposal.options;
        let i = 0;
        while (i < vector::length(options)) {
            total_votes = total_votes + *table::borrow(&proposal.votes, i);
            i = i + 1;
        };
        total_votes
    }

    // Function to check if a user has voted
    public fun has_voted(
        account: address,
        proposal_id: u64,
        voter: address
    ): bool acquires ProposalStore {
        let store = borrow_global<ProposalStore>(account);
        let proposal = table::borrow(&store.proposals, proposal_id);
        table::contains(&proposal.voters, voter)
    }

    // Function to get proposal active status
    public fun is_active(
        account: address,
        proposal_id: u64
    ): bool acquires ProposalStore {
        let store = borrow_global<ProposalStore>(account);
        let proposal = table::borrow(&store.proposals, proposal_id);
        !proposal.executed && (timestamp::now_seconds() < proposal.deadline)
    }
    // Add getter for option details
    public fun get_option(
        account: address,
        proposal_id: u64,
        option_id: u64
    ): (u64, vector<u8>) acquires ProposalStore {
        let store = borrow_global<ProposalStore>(account);
        let proposal = table::borrow(&store.proposals, proposal_id);
        let option = vector::borrow(&proposal.options, option_id);
        (option.id, option.name)
    }
}
