import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { uploadImageBuffer, deleteImage } from "../services/cloudinary.service";
import { assertOwnership } from "./journal.controller";

export const uploadPhotos = asyncHandler(async (req: Request, res: Response) => {
  const { journalEntryId } = req.body;
  if (!journalEntryId) throw new ApiError(400, "journalEntryId is required.");
  await assertOwnership(journalEntryId, req.user!.userId);

  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!files.length) throw new ApiError(400, "No images were provided.");

  const existingCount = await prisma.photo.count({ where: { journalEntryId } });

  const uploaded = await Promise.all(
    files.map(async (file, index) => {
      const result = await uploadImageBuffer(file.buffer);
      return prisma.photo.create({
        data: {
          journalEntryId,
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          position: existingCount + index,
        },
      });
    })
  );

  return ok(res, { photos: uploaded }, 201);
});

export const reorderPhotos = asyncHandler(async (req: Request, res: Response) => {
  const { journalEntryId, order } = req.body as { journalEntryId: string; order: string[] };
  if (!journalEntryId || !Array.isArray(order)) {
    throw new ApiError(400, "journalEntryId and order are required.");
  }
  await assertOwnership(journalEntryId, req.user!.userId);

  await prisma.$transaction(
    order.map((photoId, index) =>
      prisma.photo.update({ where: { id: photoId }, data: { position: index } })
    )
  );

  return ok(res, { reordered: true });
});

export const deletePhoto = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const photo = await prisma.photo.findUnique({ where: { id }, include: { journalEntry: true } });
  if (!photo) throw new ApiError(404, "Photo not found.");
  if (photo.journalEntry.userId !== req.user!.userId) throw new ApiError(403, "You don't have permission to remove this photo.");

  await deleteImage(photo.publicId);
  await prisma.photo.delete({ where: { id } });

  return ok(res, { deleted: true });
});
