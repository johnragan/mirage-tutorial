import {
  Model,
  hasMany,
  belongsTo,
  RestSerializer,
  createServer,
  Factory,
} from "miragejs";

createServer({
  serializers: {
    reminder: RestSerializer.extend({
      include: ["list"],
      embed: true,
    }),
  },

  models: {
    list: Model.extend({
      reminders: hasMany(),
    }),

    reminder: Model.extend({
      list: belongsTo(),
    }),
  },

  factories: {
    list: Factory.extend({
      name(i) {
        return `List ${i}`;
      },

      afterCreate(list, server) {
        if (!list.reminders.length) {
          server.createList("reminder", 5, { list });
        }
      },
    }),

    reminder: Factory.extend({
      text(i) {
        return `Reminder ${i}`;
      },
    }),
  },

  seeds(server) {
    server.create("list", {
      name: "Home",
      reminders: [server.create("reminder", { text: "Do taxes" })],
    });

    server.create("list");
    // serve
    // server.create("reminder", { text: "Walk the dog" });

    // server.createList("reminder", 5);
    // server.create("reminder", { text: "Take out the trash" });
    // server.create("reminder", { text: "Work out" });

    // server.create("list", {
    //   name: "Home",
    //   reminders: [server.create("reminder", { text: "Do taxes" })],
    // });

    // server.create("list", {
    //   name: "Work",
    //   reminders: [server.create("reminder", { text: "Visit bank" })],
    // });

    // server.create("list");
  },

  routes() {
    this.get("/api/lists", (schema, request) => {
      return schema.lists.all();
    });

    this.get("/api/lists/:id/reminders", (schema, request) => {
      let list = schema.lists.find(request.params.id);

      return list.reminders;
    });

    this.get("/api/reminders", (schema) => {
      return schema.reminders.all();
    });

    this.post("/api/reminders", (schema, request) => {
      let attrs = JSON.parse(request.requestBody);

      return schema.reminders.create(attrs);
    });

    this.delete("/api/reminders/:id", (schema, request) => {
      let id = request.params.id;

      return schema.reminders.find(id).destroy();
    });
  },
});
