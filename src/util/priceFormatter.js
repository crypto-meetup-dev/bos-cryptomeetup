const PriceFormatter = {
  formatPrice(price, unit = 'BOS') {
    return `${(price / 10000).toDecimal(4)} ${unit}`;
  },
  install(Vue) {
    Vue.filter('price', (value, unit) => PriceFormatter.formatPrice(value, unit));
  },
};

export default PriceFormatter;
