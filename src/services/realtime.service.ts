// // import { publisher, subscriber } from "../config/redis.config";
// import { CHANNELS } from "../constants/constant";

// export class RealtimeService {
//   static async notifyProductUpdate(productId: string) {
//     await publisher.publish(CHANNELS.PRODUCT_UPDATE, JSON.stringify({
//       changed: true
//     }));
//   }

//   static async notifyProductCreate(productId: string) {
//     await publisher.publish(CHANNELS.PRODUCT_CREATE, JSON.stringify({
//       changed: true
//     }));
//   }

//   static async notifyProductDelete(productId: string) {
//     await publisher.publish(CHANNELS.PRODUCT_DELETE, JSON.stringify({
//       changed: true
//     }));
//   }

//   static async subscribeToProductUpdates(callback: (message: any) => void) {
//     await subscriber.subscribe(CHANNELS.PRODUCT_UPDATE, (message: any) => {
//       callback(JSON.parse(message));
//     });
//   }

//   static async subscribeToProductCreates(callback: (message: any) => void) {
//     await subscriber.subscribe(CHANNELS.PRODUCT_CREATE, (message: any) => {
//       callback(JSON.parse(message));
//     });
//   }

//   static async subscribeToProductDeletes(callback: (message: any) => void) {
//     await subscriber.subscribe(CHANNELS.PRODUCT_DELETE, (message: any) => {
//       callback(JSON.parse(message));
//     });
//   }
// } 