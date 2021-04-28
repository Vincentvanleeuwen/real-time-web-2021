module.exports = {
  /**
   * If foo === bar condition in Handlebars
   * @v1  {any} First value (foo)
   * @v2  {any} Second value (bar)
   * @options  {object} Spotify user data
   * @return {boolean}
   */
  ifCond: (v1, v2, options) => {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  }
}

