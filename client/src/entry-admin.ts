import { createApp } from "vue";
import AdminApp from "./admin/App.vue"; // Root component for admin
import "./assets/admin.css";

const app = createApp(AdminApp);

// Set up client-side router if using Vue Router
// import router from './admin/admin-router'; // Create this file
// app.use(router);

app.mount("#app");

console.log("Admin SPA mounted!");
