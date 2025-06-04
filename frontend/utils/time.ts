export const getTimeLeft = (deadline: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadline - now;

    if (timeLeft <= 0) return "Ended";

    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

export const getTimeAgo = (deadline: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const timeAgo = now - deadline;

    const days = Math.floor(timeAgo / (24 * 60 * 60));
    const hours = Math.floor((timeAgo % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return "Just ended";
};