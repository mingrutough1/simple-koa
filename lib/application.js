const http = require('http');
const Emitter = require('events');
const context = require('./context');
const request = require('./request');
const response = require('./response');

class Application extends Emitter{
    constructor() {
        super();
        this.middlewares = [];
        this.context = Object.create(context);
        this.request = Object.create(request);
        this.response = Object.create(response);
    }
    use(fn) {
        this.middlewares.push(fn);
    }
    callback() {
        const fn = compose(this.middlewares); // 合成所有的中间件
        const handleRequest = (req, res) => {
            const ctx = this.createContext(req, res);
            return this.handleRequest(ctx, fn);
        }
        return handleRequest;
    }

    handleRequest(ctx, fn) {
        const handleResponse = () => this.respond(ctx);
        const onerror = err => ctx.onerror(err);

        return fn(ctx).then(handleResponse).catch(onerror);
    }

    createContext(req, res) {
        let ctx = Object.create(this.context);
        ctx.request = Object.create(this.request);
        ctx.response = Object.create(this.response);
        ctx.req = ctx.request.req = req;
        ctx.res = ctx.request.res = res;
        ctx.app = ctx.request.app = ctx.response.app = this;
        return ctx;
    }
    respond(ctx) {
        // 根据ctx.body的类型，返回最后的数据
        /* 可能的类型，代码删减了部分判断
        1. string
        2. Buffer
        3. Stream
        4. Object
        */
       console.log('answer');
        let content = ctx.body;
        if (typeof content === 'string') {
            ctx.res.end(content);
        } else if (typeof content === 'object') {
            ctx.res.end(JSON.stringify(content));
        }

    }
    listen(...args) {
        const server = http.createServer(this.callback());
        return server.listen(...args);
    }
}

function compose(middleware) {
    if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
    for (const fn of middleware) {
        if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
    }
    /**
     * @param {Object} context
     * @return {Promise}
     * @api public
     */
    return function (context, next) {
        // last called middleware #
        let index = -1
        return dispatch(0)

        function dispatch(i) {
            // 一个中间件里多次调用next
            if (i <= index) return Promise.reject(new Error('next() called multiple times'))
            index = i
            // fn就是当前的中间件
            let fn = middleware[i]
            if (i === middleware.length) fn = next // 最后一个中间件如果也next时进入(一般最后一个中间件是直接操作ctx.body，并不需要next了)
            if (!fn) return Promise.resolve() // 没有中间件，直接返回成功
            try {

                /* 
                  * 使用了bind函数返回新的函数，类似下面的代码
                  return Promise.resolve(fn(context, function next () {
                    return dispatch(i + 1)
                  }))
                */
                // dispatch.bind(null, i + 1)就是中间件里的next参数，调用它就可以进入下一个中间件
                // fn如果返回的是Promise对象，Promise.resolve直接把这个对象返回
                // fn如果返回的是普通对象，Promise.resovle把它Promise化
                return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
            } catch (err) {
                // 中间件是async的函数，报错不会走这里，直接在fnMiddleware的catch中捕获
                // 捕获中间件是普通函数时的报错,Promise化，这样才能走到fnMiddleware的catch方法
                return Promise.reject(err)
            }
        }
    }
}
module.exports = Application;