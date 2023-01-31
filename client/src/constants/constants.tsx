

export default {
    server: "local",
    main_url: "http://localhost:8000",
}

export const TOAST_LVL = {
    INFO: "info",
    SUCCESS: "success",
    WARNING: "warning",
    ERROR: "error"
}

export const CONV_LVL = {
    OWNER: 0,
    ADMIN: 1,
    USER: 2
}

export const CHANNEL_LVL = {
    PUBLIC: 0,
    PROTECTED: 1,
    PRIVATE: 2
}

export const base_url = "http://localhost:5000";
export const socket_url = "ws://localhost:5000";
export const intra_url = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1eaad37c69601826513dcbd2aad3181a977d8eeedfa631117021f93c40e84db0&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth%2Foauth&response_type=code&scope=public";

type User = {
    picture: null | string,
    name: string
}

export const generate_url = (user: User) => {
    if (user.picture) {
        if (user.picture.startsWith("https")) {
            return user.picture;
        }
        return base_url + user.picture;
    }
    return `https://avatars.dicebear.com/api/adventurer/${user.name}.svg`;
}