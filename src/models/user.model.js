import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    surName: {
      type: String,
    },
    email: {
      type: String,
      index: true,
      unique: true,
    },
    age: {
      type: Number,
    },
    password: {
      type: String,
    },
    roles: [
      {
        ref: "Role",
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const UserModel = model("user", userSchema);

export default UserModel;