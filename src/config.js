export const config = {
  fontColor: "white",
  title: "node",
  bossContent: ` @ multi (webpack)-dev-server/client?http://localhost:8081/sockjs-node (webpack)/hot/dev-server.js ./src/main.js

    warning  in ./src/pages/reader/index.vue?vue&type=template&id=6430da5c&scoped=true&

    Module Warning (from ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js):
    (Emitted value instead of an instance of Error) <v-uni-view v-for="label in item.label">: component lists rendered with v-for should have explicit keys. See https://vuejs.org/guide/list.html#key for more info.

    @ ./src/pages/reader/index.vue?vue&type=template&id=6430da5c&scoped=true& 1:0-701 1:0-701
    @ ./src/pages/reader/index.vue
    @ ./src/pages.json
    @ ./src/main.js
    @ multi (webpack)-dev-server/client?http://localhost:8081/sockjs-node (webpack)/hot/dev-server.js ./src/main.js

  `
};