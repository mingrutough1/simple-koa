
const proto = module.exports = {
    // context自身的方法
    toJSON() {
        return {
            request: this.request.toJSON(),
            response: this.response.toJSON(),
            app: this.app.toJSON(),
            originalUrl: this.originalUrl,
            req: '<original node req>',
            res: '<original node res>',
            socket: '<original node socket>'
        };
    },
    onerror(err) {
        const { res } = this;
        if ('ENOENT' == err.code) {
            err.status = 404;
          } else {
            err.status = 500;
          }
          this.status = err.status;
          // 触发error事件
          this.app.emit('error', err, this);
          res.end(err.message || 'Internal error');
    },
    get status() {
        return this.response.status;
    },
    set status(newVal) {
        this.response.status = newVal;
    },
    get body() {
        return this.response.body;
    },
    set body(newVal) {
        this.response.body = newVal;
    },
    get url() {
        return this.request.url;
    },
    set url(newVal) {
        this.request.url = newVal;
    },
    get header() {
        return this.request.header;
    },
}
