const getTheme = () => ({
  mobberBorderHighlightColor: getCSSVariable("--mobber-border-highlight-color"),
  mobberBorderColor: getCSSVariable("--mobber-border-color")
});

const getCSSVariable = variableName =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

module.exports = {
  getTheme
};
