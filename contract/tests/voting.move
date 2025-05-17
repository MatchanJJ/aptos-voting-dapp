#[test_only]
module voting_addr::test_voting{
    use std::vector;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use voting_addr::Voting;
    use aptos_framework::system_addresses;


    const TITLE: vector<u8> = b"Proposal Title";
    const DESCRIPTION: vector<u8> = b"Proposal Description";
    const OPTION1: vector<u8> = b"Option 1";
    const OPTION2: vector<u8> = b"Option 2";

    fun setup(): signer {
        let framework_account = account::create_account_for_test(@aptos_framework);
        let account = account::create_account_for_test(@voting_addr);
        timestamp::set_time_has_started_for_testing(&framework_account);
        Voting::init(&account);
        account
    }

    #[test]
    fun test_create_proposal(){
        let account = setup();
        let options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, OPTION1);
        vector::push_back(&mut options, OPTION2);

        let current_time = timestamp::now_seconds();
        let deadline = current_time + 86400;

        Voting::create_proposal(
            &account,
            TITLE,
            DESCRIPTION,
            0,
            options,
            deadline,
        );
        let proposal_count = Voting::get_proposal_count(@voting_addr);
        assert!(proposal_count == 1, 0);
        let (id, creator, title, description, proposal_type, options, deadline_returned, executed) = 
            Voting::get_proposal_info(@voting_addr, 0);

        assert!(id == 0, 1);
        assert!(creator == @voting_addr, 2);
        assert!(title == TITLE, 3);
        assert!(description == DESCRIPTION, 4);
        assert!(vector::length(&options) == 2, 5);
        assert!(!executed, 6);
    }

    //test vote
    #[test]
    fun test_vote(){
        let account = setup();
        let voter = account::create_account_for_test(@test_addr);
        let options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, OPTION1);
        vector::push_back(&mut options, OPTION2);

        let current_time = timestamp::now_seconds();
        let deadline = current_time + 86400;

        Voting::create_proposal(
            &account,
            TITLE,
            DESCRIPTION,
            0,
            options,
            deadline,
        );
        Voting::vote(
            &voter,//voter
            @voting_addr,
            0,
            0,
        );

        let vote_count = Voting::get_vote_count_per_candidate(@voting_addr,0,0);
        assert!(vote_count == 1, 0);
        assert!(Voting::has_voted(@voting_addr, 0, @test_addr), 2);

        let total_votes = Voting::get_proposal_total_votes(@voting_addr, 0);
        assert!(total_votes == 1, 3);
        
        
    }

    //test double vote - expected failure
    #[test]
    #[expected_failure(abort_code = 2)]
    fun test_double_vote(){
        let account = setup();
        let voter = account::create_account_for_test(@test_addr);
        let options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, OPTION1);
        vector::push_back(&mut options, OPTION2);

        let current_time = timestamp::now_seconds();
        let deadline = current_time + 86400;

        Voting::create_proposal(
            &account,
            TITLE,
            DESCRIPTION,
            0,
            options,
            deadline,
        );
        Voting::vote(
            &voter,
            @voting_addr,
            0,
            0,
        );

        Voting::vote(
            &voter,//voter
            @voting_addr,
            0,
            1,
        );
    }
    //test proposal active status
    #[test]
    fun test_proposal_active_status(){
        let account = setup();
        let options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, OPTION1);
        vector::push_back(&mut options, OPTION2);

        let current_time = timestamp::now_seconds();
        let deadline = current_time + 86400;

        Voting::create_proposal(
            &account,
            TITLE,
            DESCRIPTION,
            0,
            options,
            deadline,
        );
        let proposal_active = Voting::is_active(@voting_addr, 0);
        assert!(proposal_active, 0);
        let (id, creator, title, description, proposal_type, options, deadline_returned, executed) = 
            Voting::get_proposal_info(@voting_addr, 0);
        let (option1_id, option1_name) = Voting::get_option(@voting_addr, 0, 0);
        let (option2_id, option2_name) = Voting::get_option(@voting_addr, 0, 1);

        assert!(id == 0, 1);
        assert!(creator == @voting_addr, 2);
        assert!(title == TITLE, 3);
        assert!(description == DESCRIPTION, 4);
        assert!(vector::length(&options) == 2, 5);
        assert!(option1_id == 0, 6);
        assert!(option2_id == 1, 7);
        assert!(option1_name == OPTION1, 8);
        assert!(option2_name == OPTION2, 9);
        assert!(deadline_returned == deadline, 10);
        assert!(!executed, 11);
    }

}