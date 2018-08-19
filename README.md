# You Need A Budget Reporting

This is a simple set of interactive visualizations utilizing the newly released YNAB API. See [https://api.youneedabudget.com/](https://api.youneedabudget.com/) for more information.


# Instructions to use

To run the application, you'll first need to use Yarn to install all requirements.

```
yarn
```

Next, add your YNAB API Key and preferred PORT to a `.env` file which will be read by the application on startup.

```
YNAB_BUDGET_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

Next, use yarn to start the application.

```
yarn start
```

Finally, visit your app at [http://localhost:4200](http://localhost:4200).

# Application Description
This app utilizes [DC.js](https://github.com/dc-js/dc.js), [Crossfilter](https://github.com/crossfilter/crossfilter) and
[D3](https://github.com/d3/d3) to provide basic visualizations surrounding the transaction history for a particular budget in YNAB.

The side bar provides a dropdown where users can select their preferred budget and include/exclude given
categories from the data set.  

On the Overview page, the user is provided with visualizations surrounding their transactions.  These
visualizations are selectable and allow the user to filter the data used across the page.

On the Progress page, users are presented with zoomable charts that present the current month's progress
for each selected category.  This provides a quick sanity check to see if your spending is inline with 
the budget goal you have in mind.
