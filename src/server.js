import {
  createServer,
  Model,
  hasMany,
  belongsTo,
  RestSerializer,
  Factory,
  trait,
} from "miragejs";

// This example uses another example repo and builds on it.
// it is basically a collection of tasks/reminders that are either
// completed, incomplete, and can be pinned to show they are important.

// Don't bother looking at the App.js and Reminder.js - they are not
// really important.  Look at this file for how it works.

// Run the application with yarn start (don't forget to "nvm use").  Note
// that you can click on the left edge to open up the lists view.  Play
// with it - create new reminders, delete them, Add Lists, etc.  Then
// refresh it and compare it against the seeded date.

// Look at index.js lines 10 - 17 to see how this is included.  None
// of the other code has to be updated.
export default function (environment = "development") {
  // CreateServer creates the mock server instance
  return createServer({
    environment,

    // I would not look at this first, but come back and look at this last.
    // All you need to know is that serializes allow you to alter the JSON
    // that is returned.  In this case, it is adding the list that the
    // reminder belongs to.
    serializers: {
      reminder: RestSerializer.extend({
        include: ["list"],
        embed: true,
      }),
    },

    // For all the entities you are extending, you need to extend from Model
    // and inform MirageJS of its relationships (if any).
    models: {
      // This is the list model.  It can have many reminders.
      list: Model.extend({
        reminders: hasMany(),
      }),

      // This is the reminder model.  It can only belong to one list
      reminder: Model.extend({
        list: belongsTo(),
      }),
    },

    // This aids in seeding.  You can create entity by hand, or leverage factories
    // to create unique instance on each next invocation.
    factories: {
      // This factory creates new list instances.
      list: Factory.extend({
        // First is named 'List 1', then 'List 2', etc.
        name(i) {
          return `List ${i}`;
        },

        // If you create the list with this trait 'withReminders', it will create the
        // next list name with the next monotonically increasing number, and
        // then create 5 reminders associated with it.
        withReminders: trait({
          afterCreate(list, server) {
            server.createList("reminder", 5, { list });
          },
        }),
      }),

      // This factory creates new reminders with unique names in monotonically
      // increasing order - 'Reminder 1', 'Reminder 2', etc.
      reminder: Factory.extend({
        text(i) {
          return `Reminder ${i}`;
        },
      }),
    },

    // While MirageJS supports creation of new entities and in-memory only
    // persistence, you can pre-populate it
    seeds(server) {
      // Create a list named "Home" without using a factory.  Then create a
      // reminder without using a factory and assign it to this "Home" list
      let homeList = server.create("list", { name: "Home" });
      server.create("reminder", { list: homeList, text: "Do taxes" });

      // Another list, without using a factory
      let workList = server.create("list", { name: "Work" });
      server.create("reminder", { list: workList, text: "Visit bank" });

      // An explicitly named reminder, but not associated with a list.
      server.create("reminder", { text: "Walk the dog" });

      // Created using the reminder factory - "Reminder 3"
      server.create("reminder");

      // Creates 2 more reminders - "Reminder 4" and "Reminder 5"
      server.createList("reminder", 2);

      // Creates "Reminder 6" and "Reminder 7" associated with "List 2"
      // The two reminders and "List 2" were created via factories
      server.create("list", {
        reminders: server.createList("reminder", 2),
      });

      // Creates the new list ("List 3") using the "withRemainders" trait;
      // this results in Reminders 8 - 12 being created and associated with
      // List 3.
      server.create("list", "withReminders");
    },

    // Note that this can do simple and complicated URLs, such as
    // "/api/lists/:id/reminders".
    // Because you have already created a schema via models and relationships,
    // creating the actual routes is a snap!
    routes() {
      // Return all lists.
      this.get("/api/lists", (schema, request) => {
        return schema.lists.all();
      });

      // Return all models
      this.get("/api/reminders", (schema) => {
        return schema.reminders.all();
      });

      // Creating new models - will automatically associate with the correct
      // lists due to it understanding the schema.
      this.post("/api/reminders", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);

        return schema.reminders.create(attrs);
      });

      // This is here solely to show that you can also return entities
      // statically without having to use models, relationships and schema.
      // You can keep it as simple or complex as you wish
      this.get("/api/reminders_static", () => ({
        reminders: [
          { id: 1, text: "Walk the dog" },
          { id: 2, text: "Take out the trash" },
          { id: 3, text: "Work out" },
        ],
      }));

      // Easy to delete
      this.delete("/api/reminders/:id", (schema, request) => {
        let id = request.params.id;

        return schema.reminders.find(id).destroy();
      });

      // This made the more complex task of getting only the reminders associated
      // with a particular list easy.
      this.get("/api/lists/:id/reminders", (schema, request) => {
        let listId = request.params.id;
        let list = schema.lists.find(listId);

        return list.reminders;
      });
    },
  });
}

// You can also use this with testing:  yarn test watchAll

// This example has screen based testing, so if the screens change you
// may need to do yarn test -u watchAll

// When done here, the documentation is quite good:  https://miragejs.com/
// Just straight into the tutorial (on which this is based), or go to \
// "Read the Docs"
