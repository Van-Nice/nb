import UserSettings from "./UserSettings";
export default class User {
    constructor(id, name, email, token, settings) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.token = token;
        this.settings = new UserSettings(settings);
    }
}