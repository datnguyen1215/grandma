type Client = ReadableStreamDefaultController;

const clients: Set<Client> = new Set();

export function addClient(controller: Client) {
  clients.add(controller);
}

export function removeClient(controller: Client) {
  clients.delete(controller);
}

export function notifyClients(photoId: number) {
  for (const controller of clients) {
    controller.enqueue(`data: ${JSON.stringify({ id: photoId })}\n\n`);
  }
}
