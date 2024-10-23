class Nodes {
  value: any;
  next: Nodes | null;

  constructor(value: any) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  first: Nodes | null;
  last: Nodes | null;
  size: number;

  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }

  enqueue(value: any) {
    const newNode = new Nodes(value);
    if (!this.first) {
      this.first = newNode;
      this.last = newNode;
    } else {
      this.last!.next = newNode;
      this.last = newNode;
    }
    this.size++;
  }

  dequeue(): any | null {
    if (!this.first) return null;
    const temp = this.first;
    this.first = this.first.next;
    if (!this.first) {
      this.last = null;
    }
    this.size--;
    return temp.value;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }
}

export function objectToQueue(obj: Record<string, any>): Queue {
  const queue = new Queue();

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      queue.enqueue({ key, value: obj[key] })
    }
  }

  return queue;
}

export { Queue };