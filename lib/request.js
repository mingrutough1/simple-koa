module.exports = {
    get header() {
        return this.req.headers;
    },
    set header(val) {
        this.req.headers = val;
    },
    get url() {
        return this.req.url;
    },
    set header(val) {
        this.req.url = val;
    }
}