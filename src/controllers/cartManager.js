import { cartModel } from "../models/cart.model.js";


class CartManager {
//metodo para obtener carrito por id
  getCartById = async (cartId) => {
    try {
      return await cartModel
        .findOne({ _id: cartId })
        .lean()
        .populate("products._id");
    } catch (err) {
      return err.message;
    }
  };

  getAllCarts = async () => {
    try {
      return await cartModel.find().lean().populate("products._id");
    } catch (err) {
      console.error(err);
      throw new Error("Error al obtener todos los carritos");
    }
  };


  // metodo para crear carrito
  addCart = async (products) => {
    try {
      const cartCreated = await cartModel.create({});
      products.forEach((product) => cartCreated.products.push(product));
      await cartCreated.save();
      return cartCreated;
    } catch (err) {
      return err.message;
    }
  };

  // metodo para agregar producto al carrito
  addProductInCart = async (cid, productFromBody) => {
    try {
      const cart = await cartsModel.findOne({ _id: cid });
      const findProduct = cart.products.some((product) => product._id.toString() === productFromBody._id);
      if (findProduct) {
        await cartsModel.updateOne({ _id: cid, "products._id": productFromBody._id }, { $inc: { "products.$.quantity": productFromBody.quantity }});
        return await cartsModel.findOne({ _id: cid });
      }
      await cartsModel.updateOne({ _id: cid }, { $push: { products: { _id: productFromBody._id, quantity: productFromBody.quantity, price: productFromBody.price }}});
    } catch (err) {
      console.log(err.message);
      return err;
    }
  };
}
  

export default CartManager;