import { Request, Response } from "express";
import {
  createTagService,
  updateTagService,
  deleteTagService,
  getTagsService,
  getTagByIdService
} from "../services/tags.service";

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, categories } = req.body;
    const savedTag = await createTagService({ name, categories });
    
    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: savedTag
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 400).json({
      success: false,
      message: error.message
    });
  }
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await getTagsService();
    return res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTagById = async (req: Request, res: Response) => {
  try {
    const tag = await getTagByIdService(req.params.id);
    return res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categories } = req.body;
    
    const updatedTag = await updateTagService(id, { name, categories });
    
    return res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      data: updatedTag
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteTagService(id);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};
