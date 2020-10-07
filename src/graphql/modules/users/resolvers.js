import User from '../../../models/User'
import { USER_ADDED, USER_DELETED, USER_UPDATED }  from './channels'

export default {
  User: {
    fullName: (user) => `${user.firstName} ${user.lastName}`,
  },
  Query: {
    users: () => User.find(),
    user: (_, { id}) => User.findById(id)
  },
  Mutation: {
    createUser: async (_, { data }, { pubsub }) => {
      const user = await User.create(data);
      
      pubsub.publish(USER_ADDED, {
        userAdded: user,
      });

      return user;
    },
    updateUser: async (_, { id, data }, { pubsub }) => { 
      const user = await User.findOneAndUpdate(id, data, { new: true });

      pubsub.publish(USER_UPDATED, {
        userUpdated: user,
      })

      return user;

    },
    deleteUser: async (_, { id }, {pubsub}) => {
      const user = await User.findByIdAndDelete(id);

      pubsub.publish(USER_DELETED, {
        userDeleted: user,
      })

      return !!user;
    },
  },
  Subscription: {
    userAdded: {
      subscribe: (obj, args, { pubsub }) => pubsub.asyncIterator(USER_ADDED),
    },
    userUpdated: {
      subscribe: (obj, args, { pubsub }) => pubsub.asyncIterator(USER_UPDATED),
    },
    userDeleted: {
      subscribe: ( obj, args, { pubsub }) => pubsub.asyncIterator(USER_DELETED),
    },
  },
};