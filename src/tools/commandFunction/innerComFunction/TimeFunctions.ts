export const getCurrentDateTime = () => {
    const now = new Date();
    return now;
};

export const getTimeDifference = (createdDate: Date) => {
    const now = getCurrentDateTime();
    const diffInMs = now.getTime() - createdDate.getTime();

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);

    if (diffInSeconds < 60) {
        return `⏱️ ${diffInSeconds}초 전 작성`;
    } else if (diffInMinutes < 60) {
        return `⏱️ ${diffInMinutes}분 전 작성`;
    } else if (diffInHours < 24) {
        return `⏱️ ${diffInHours}시간 전 작성`;
    } else if (diffInDays < 30) {
        return `⏱️ ${diffInDays}일 전 작성`;
    } else if (diffInMonths < 12) {
        return `⏱️ ${diffInMonths}달 전 작성`;
    } else {
        return `⏱️ ${diffInYears}년 전 작성`;
    }
};