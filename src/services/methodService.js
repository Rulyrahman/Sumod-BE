import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const msgNotFound = "Method not found";

const isMethodTakenUpdate = async (name, methodId) => {
  const methodData = await prisma.method.findUnique({
    where: { name },
  });

  return methodData && methodData.id !== methodId;
};

const isMethodTakenCreate = async (name) => {
  const method = await prisma.method.findUnique({
    where: { name },
  });

  return method !== null;
};

const createMethod = async (name, description, file) => {
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
    throw new Error("Method name is required");
  }

  const existingMethod = await prisma.method.findUnique({
    where: { name },
  });

  if (existingMethod) {
    await deleteLocalFile();
    throw new Error("Method name already taken");
  }

  let pictureUrl = "";
  if (file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "products", // masih disimpan didalam folder products cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      });
      pictureUrl = uploadResult.secure_url;
    } catch (error) {
      console.log(error.message);
      throw new Error(`Failed to upload image to Cloudinary. Error: ${error.message}`);
    }
  }

  await deleteLocalFile(file.path);

  const newMethod = await prisma.method.create({
    data: {
      name,
      description,
      picture: pictureUrl,
    },
  });

  return newMethod;
};

const getMethodById = async (id) => {
  return await prisma.method.findUnique({
    where: { id },
  });
};

const getSingleMethod = async (id) => {
  if (typeof id !== "number" || isNaN(id)) {
    throw new Error(msgNotFound);
  }

  const methodData = await getMethodById(id);
  if (!methodData) {
    throw new Error(msgNotFound);
  }

  return methodData;
};

const getAllMethods = async (page, limit) => {
  const pageParse = Number(page, 10);
  const limitParse = Number(limit, 10);
  if (typeof pageParse !== "number" || isNaN(pageParse)) {
    throw new Error("Page and limit must be numbers");
  }

  if (typeof limitParse !== "number" || isNaN(limitParse)) {
    throw new Error("Limit must be a number");
  }

  const offset = (pageParse - 1) * limitParse;
  const methodsData = await prisma.method.findMany({
    skip: offset,
    take: limitParse,
  });
  const totalMethods = await prisma.method.count();

  return {
    methodsData,
    currentPage: pageParse,
    limit: limitParse,
    totalPages: Math.ceil(totalMethods / limitParse),
    totalMethods,
  };
};

const updateMethod = async (id, name, description, picture) => {
  const deleteLocalFile = async () => {
    const filePath = path.join("src/uploads/", picture.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        throw new Error("Error deleting local file", err);
      }
    });
  };

  if (typeof id !== "number" || isNaN(id)) {
    throw new Error("Invalid ID provided");
  }

  const method = await getMethodById(id);
  if (!method) {
    await deleteLocalFile();
    throw new Error("Method not found");
  }

  if (name && (await isMethodTakenUpdate(name, id))) {
    await deleteLocalFile();
    throw new Error("Method name is already taken by another data");
  }

  if (picture) {
    try {
      const uploadResult = await cloudinary.uploader.upload(picture.path, {
        folder: "products", // disimpan didalam folder products cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      });

      await deleteLocalFile();

      picture = uploadResult.secure_url;

      if (method.picture) {
        const oldImagePublicId = method.picture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${oldImagePublicId}`);
      }
    } catch (error) {
      await deleteLocalFile();
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  return await prisma.method.update({
    where: { id },
    data: {
      name,
      description,
      picture,
    },
  });
};


// ?? 
const deleteUser = async (id) => {
  if (typeof id !== "number" || isNaN(id)) {
    throw new Error(msgNotFound);
  }

  const methodData = await getMethodById(id);
  if (!methodData) {
    throw new Error(msgNotFound);
  }

  return await prisma.method.delete({
    where: { id },
  });
};

export { createMethod, getSingleMethod, getAllMethods, updateMethod, deleteUser };
