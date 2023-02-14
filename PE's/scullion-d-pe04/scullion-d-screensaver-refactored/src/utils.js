/// Returns a random color
export const getRandomColor = () => {
    /// Returns a value between 55 an 255
    const getByte = () => {
        return 55 + Math.round(Math.random() * 200);
    }
    return `rgba(${getByte()},${getByte()},${getByte()},.8)`;
}

///Returns a random number
export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}