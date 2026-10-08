// import express
const express = require("express");

// import prisma client
const prisma = require("../prisma/client");

// import validationResult dari express-validator
const { validationResult } = require("express-validator");

// 1. GET ALL POSTS
const findPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).send({
      success: true,
      message: "Get All Posts Successfully",
      data: posts,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// 2. CREATE POST
const createPost = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  try {
    // Ambil gambar dari req.file (jika upload) atau req.body.image (jika emoji)
    const imageName = req.file ? req.file.filename : (req.body.image || "📌");

    const post = await prisma.post.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        image: imageName,
      },
    });

    res.status(201).send({
      success: true,
      message: "Post Created Successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// 3. GET POST BY ID
const findPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post Not Found",
      });
    }

    res.status(200).send({
      success: true,
      message: `Get Detail Post By ID : ${id}`,
      data: post,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4. UPDATE POST
const updatePost = async (req, res) => {
  const { id } = req.params;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  try {
    // Cek apakah post ada di database
    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingPost) {
      return res.status(404).send({
        success: false,
        message: "Post Not Found",
      });
    }

    // Prioritas image: 1. File Upload Baru -> 2. Body Image Baru (Emoji) -> 3. Image Lama
    let imageName = existingPost.image;
    if (req.file) {
      imageName = req.file.filename;
    } else if (req.body.image) {
      imageName = req.body.image;
    }

    const post = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        title: req.body.title,
        content: req.body.content,
        image: imageName,
      },
    });

    res.status(200).send({
      success: true,
      message: "Post Updated Successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// 5. DELETE POST
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).send({
      success: true,
      message: "Post Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  findPosts,
  createPost,
  findPostById,
  updatePost,
  deletePost,
};