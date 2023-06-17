class Favorite {
    constructor(text, url, comments, fid = crypto.randomUUID()) {
        this.text = text;
        this.url = url;
        this.comments = comments;
        this.fid = fid;
    }
}

export { Favorite };