import index from './../dist/index';
import event from './event.json';

const context = {
  fail: e => e
};

index.handler(event, context, (e, v) => {
  if (e) {
    console.log('\n ----- ERROR -----\n', e, '\n -----------------');
    return;
  }
  console.log('\n ----- OUTPUT -----\n', JSON.stringify(v), '\n ------------------');
});
