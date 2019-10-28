const Kao = require('./lib/application');
const app = new Kao();
app.use(async (ctx, next) => {
  console.log('1-start');
  await next();
})
app.use(async (ctx) => {
  ctx.body = 'hello tc';
});
app.listen(3001, () => {
  console.log('server start at 3001');
});
