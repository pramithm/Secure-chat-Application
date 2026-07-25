import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  _id: mongoose.Types.ObjectId;
  uploader: mongoose.Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

const FileSchema: Schema = new Schema(
  {
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IFile>('File', FileSchema);
