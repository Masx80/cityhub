// src/app/api/users/webhooks/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;
  if (!SIGNING_SECRET) {
    throw new Error("Error: Please insert a signing secret");
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook: ", err);
    return new Response("Error: Verification Error", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Processing ${eventType} for user ID: ${id}, Payload:`, JSON.stringify(evt.data, null, 2));

  if (eventType === "user.created") {
    const data = evt.data;
    if (data.id && data.first_name) {
      try {
        await db.insert(users).values({
          clerkId: data.id,
          name: `${data.first_name}${data.last_name ? ` ${data.last_name}` : ''}`,
          imageUrl: data.image_url || null,
        });
      } catch (err) {
        console.error("Database error in user.created:", err);
        return new Response("Database error", { status: 500 });
      }
    } else {
      console.error("Missing required fields in user.created payload");
      return new Response("Missing required fields", { status: 400 });
    }
  }

  if (eventType === "user.deleted") {
    const data = evt.data;
    if (data.id) {
      try {
        const result = await db.delete(users).where(eq(users.clerkId, data.id));
        if (result.rowCount === 0) {
          console.warn(`User ${data.id} not found for deletion`);
        }
      } catch (err) {
        console.error("Database error in user.deleted:", err);
        return new Response("Database error", { status: 500 });
      }
    }
  }

  if (eventType === "user.updated") {
    const data = evt.data;
    if (data.id && data.first_name) {
      try {
        await db
          .update(users)
          .set({
            name: `${data.first_name}${data.last_name ? ` ${data.last_name}` : ''}`,
            imageUrl: data.image_url || null,
          })
          .where(eq(users.clerkId, data.id));
      } catch (err) {
        console.error("Database error in user.updated:", err);
        return new Response("Database error", { status: 500 });
      }
    } else {
      console.error("Missing required fields in user.updated payload");
      return new Response("Missing required fields", { status: 400 });
    }
  } else {
    console.log(`Unhandled event type: ${eventType}`);
    return new Response(`Unhandled event type: ${eventType}`, { status: 200 });
  }

  return new Response("Webhook received", { status: 200 });
}