import { get, post, put, patch } from '../config/api';

export const UserService = {
    single: () => get(`/users/profile`),
}