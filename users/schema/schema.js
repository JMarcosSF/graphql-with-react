const graphql = require('graphql');
const _ = require('lodash');
const axios = require('axios');

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,	// Takes in a Root Query and returns a GraphQLSchema Instance
	GraphQLList
} = graphql;

// We treat associations between types exactly as though it were another field.
const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: () => ({	// Using closures here to define types to avoid circular references
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		users: {	// Defining bi-directional access to users here
			type: new GraphQLList(UserType),
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
					.then(resp => resp.data);
			}
		}
	})
});

// Using GraphQLObjectType about the pressence of "user" in our application
// Instruct GraphQL to instruct GraphQL about our 'user'
const UserType = new GraphQLObjectType({
  	name: 'User',
	fields: () => ({	// Using closures here to define types to avoid circular references
	    id: { type: GraphQLString },
	    firstName: { type: GraphQLString },
	    age: { type: GraphQLInt },
	    company: {
	    	type: CompanyType,
	    	resolve(parentValue, args) {
	    		// Associating user.companyId and company.id here
	    		return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
	    			.then(resp => resp.data);
	    	}
	    }
  })
});

// Our "Root Query"
// The purpose of the “Root Query” is to 
// allow GraphQL to jump and land on a very specific node on the graph of our data.
// Here, we are saying "give me an id, and I will give you a user".
// The "resolve" function in our root Query actually goes into our DB and finds the
// actual data we're looking for. It actually reaches out and grabs the data.
// The "resolve" function can ALSO return a "promise". All data fetching is async in nature.
// Thus we will almost always return a promise.
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: { id: { type: GraphQLString } },
			resolve(parentValue, args) {	// The passed id will be present within the "args"
				return axios.get(`http://localhost:3000/users/${args.id}`)
					.then(resp => resp.data);
			}
		},
		company: {
			type: CompanyType,
			args: { id: { type: GraphQLString } },
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${args.id}`)
					.then(resp => resp.data);
			}
		}
	}
});

// Export the schema to make available to other parts of our app
module.exports = new GraphQLSchema({
	query: RootQuery
});