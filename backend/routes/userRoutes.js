import express from "express";
import { getUsers, detailUser, createUser, updateUser, deleteUser, validateUser  } from "../controllers/userControllers.js";

const router = express();

// router.get('/', getUsers)

router.route('/').get(getUsers).post(validateUser(), createUser)
router.route('/:id').post(detailUser).put(validateUser(true), updateUser).delete(deleteUser)


export default router