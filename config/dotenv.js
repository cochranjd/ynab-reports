module.exports = function(env) {
  return {
    clientAllowedKeys: ['YNAB_API_KEY', 'YNAB_BUDGET_ID', 'YNAB_CATEGORY_TAG', 'YNAB_BUDGET_MONTH'],
    failOnMissingKey: false
  };
};
