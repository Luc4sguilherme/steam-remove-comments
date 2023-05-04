import colour from 'cli-color';
import moment from 'moment';

const formatDate = 'MM/DD/YYYY - HH:mm:ss,SSS ZZ';

const error = (data) => {
  const text = `${moment().format(formatDate)} @ [ ERROR ] ${data}`;

  console.log(colour.redBright(text));
};

const warn = (data) => {
  const text = `${moment().format(formatDate)} @ [ WARN ] ${data}`;

  console.log(colour.yellowBright(text));
};

const info = (data) => {
  const text = `${moment().format(formatDate)} @ [ INFO ] ${data}`;

  console.log(colour.greenBright(text));
};

export default {
  error,
  warn,
  info,
};
