const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

// If any request comes into our app looking for the route "/graphql",
// we want GraphQL lib to handle the request.
app.use('/graphql', expressGraphQL({
	schema,
	graphiql: true
}));

// Run express on prot 4000
app.listen(4000, () => {
	console.log('Listening');
});