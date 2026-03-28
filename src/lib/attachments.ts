import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { storage, db } from './firebase'
import type { Attachment, AttachmentType } from './types'

function detectType(url: string): AttachmentType {
  const lower = url.toLowerCase()
  if (lower.match(/\.(pdf)$/)) return 'pdf'
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
  if (lower.match(/\.(doc|docx|xls|xlsx|ppt|zip|rar)$/)) return 'file'
  return 'link'
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Add a web link to a node
export async function addLinkToNode(nodeId: string, url: string, name?: string): Promise<Attachment> {
  const attachment: Attachment = {
    id: generateId(),
    type: detectType(url),
    url,
    name: name || new URL(url).hostname + new URL(url).pathname.slice(0, 30),
    addedAt: Date.now(),
  }

  await updateDoc(doc(db, 'nodes', nodeId), {
    attachments: arrayUnion(attachment),
  })

  return attachment
}

// Upload a file to Firebase Storage and attach to node
export async function uploadFileToNode(nodeId: string, file: File): Promise<Attachment> {
  const path = `attachments/${nodeId}/${generateId()}_${file.name}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  const type: AttachmentType = file.type.startsWith('image/') ? 'image'
    : file.type === 'application/pdf' ? 'pdf'
    : 'file'

  const attachment: Attachment = {
    id: generateId(),
    type,
    url,
    name: file.name,
    addedAt: Date.now(),
  }

  await updateDoc(doc(db, 'nodes', nodeId), {
    attachments: arrayUnion(attachment),
  })

  return attachment
}

// Remove an attachment from a node
export async function removeAttachmentFromNode(nodeId: string, attachment: Attachment): Promise<void> {
  await updateDoc(doc(db, 'nodes', nodeId), {
    attachments: arrayRemove(attachment),
  })
}
