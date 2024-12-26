import { PrismaClient } from "@prisma/client";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();
const msgNotFound = "Product not found";

// import { EventEmitter } from "events";

// const progressEmitter = new EventEmitter();

// export const sendProgressUpdates = (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   progressEmitter.on("progress", (data) => {
//     res.write(`data: ${JSON.stringify(data)}\n\n`);
//   });
// };

// const uploadToCloudinaryWithProgress = (filePath, onProgress) => {
//   return new Promise((resolve, reject) => {
//     const fileStats = fs.statSync(filePath);
//     const totalBytes = fileStats.size; 

//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: "products",
//         allowed_formats: ["jpg", "png", "jpeg", "webp"],
//       },
//       (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       }
//     );

//     const fileStream = fs.createReadStream(filePath);
//     let uploadedBytes = 0;

//     fileStream.on("data", (chunk) => {
//       uploadedBytes += chunk.length;
//       const progress = {
//         type: "cloudinary",
//         uploadedBytes,
//         totalBytes,
//         progressPercentage: Math.round((uploadedBytes / totalBytes) * 100),
//       };
//       onProgress(progress);
//       progressEmitter.emit("progress", progress);
//     });

//     fileStream.on("end", () => {
//       progressEmitter.removeAllListeners("progress");
//     });

//     fileStream.pipe(uploadStream);
//   });
// };

const isProductTakenUpdate = async (name, productId) => {
  const productData = await prisma.product.findUnique({
    where: { name },
  });

  if (productData && productData.id !== productId) {
    return true;
  }
  return false;
};

const isProductTakenCreate = async (name) => {
  const user = await prisma.product.findUnique({
    where: { name },
  });

  return user !== null;
};

const createProduct = async (name, description, file) => {
  const deleteLocalFile = async () => {
    const filePath = path.join("src/uploads/", file.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        throw new Error("Error deleting local file", err);
      }
    });
  };

  if (!name) {
    await deleteLocalFile();
    throw new Error("Product name is required");
  }

  const existingProduct = await prisma.product.findUnique({
    where: { name },
  });

  if (existingProduct) {
    await deleteLocalFile();
    throw new Error("Product name already taken");
  }

  let pictureUrl = "";
  if (file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      });
      pictureUrl = uploadResult.secure_url;
    } catch (error) {
      await deleteLocalFile();
      console.log(error.message);
      throw new Error(`Failed to upload image to Cloudinary. Error: ${error.message}`);
    }
  }

  await deleteLocalFile();

  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      picture: pictureUrl,
    },
  });

  return newProduct;
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};

const getSingleProduct = async (id) => {
  if (typeof id !== "number" || isNaN(id)) {
    throw new Error(msgNotFound);
  }

  const productData = await getProductById(id);
  if (!productData) {
    throw new Error(msgNotFound);
  }

  return productData;
};

const getAllProducts = async (page, limit) => {
  const pageParse = Number(page, 10);
  const limitParse = Number(limit, 10);
  if (typeof pageParse !== "number" || isNaN(pageParse)) {
    throw new Error("Page must be a number");
  }

  if (typeof limitParse !== "number" || isNaN(limitParse)) {
    throw new Error("Limit must be a number");
  }

  const offset = (pageParse - 1) * limitParse;
  const productsData = await prisma.product.findMany({
    skip: offset,
    take: limitParse,
  });
  const totalProducts = await prisma.product.count();

  return {
    productsData,
    currentPage: pageParse,
    limit: limitParse,
    totalPages: Math.ceil(totalProducts / limitParse),
    totalProducts,
  };
};

const updateProduct = async (id, name, description, picture) => {
  const deleteLocalFile = async () => {
    const filePath = path.join("src/uploads/", picture.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        throw new Error("Error deleting local file", err);
      }
    });
  };

  if (typeof id !== "number" || isNaN(id)) {
    await deleteLocalFile();
    throw new Error("Invalid ID provided");
  }

  const product = await getProductById(id);
  if (!product) {
    await deleteLocalFile();
    throw new Error("Product not found");
  }

  if (name && (await isProductTakenUpdate(name, id))) {
    await deleteLocalFile();
    throw new Error("Product name is already taken by another data");
  }


  if (picture) {
    try {
      const uploadResult = await cloudinary.uploader.upload(picture.path, {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      });

      await deleteLocalFile();

      picture = uploadResult.secure_url;

      if (product.picture) {
        const oldImagePublicId = product.picture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${oldImagePublicId}`);
      }
    } catch (error) {
      await deleteLocalFile();
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  return await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      picture,
    },
  });
};

const deleteUser = async (id) => {
  if (typeof id !== "number" || isNaN(id)) {
    throw new Error(msgNotFound);
  }

  const productData = await getProductById(id);
  if (!productData) {
    throw new Error(msgNotFound);
  }

  return await prisma.product.delete({
    where: { id },
  });
};

export { createProduct, getSingleProduct, getAllProducts, updateProduct, deleteUser };
