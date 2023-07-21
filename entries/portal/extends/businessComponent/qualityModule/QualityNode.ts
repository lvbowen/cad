export class QualityNode<T> {

  public data: QualityNode<T> | null;

  public next: QualityNode<T> | null;

  public job: Promise<any>;

  constructor( data, job ) {
    this.next = null;
    this.data = data;
    this.job = job;
  }
}

export class QualityNodeChain<T> {

  public head: QualityNode<T> | null;

  public length: number;

  constructor() {
    this.head = null;
    this.length = 0;
  }

  static createQualityNode( data, job ) {
    return new QualityNode( data, job );
  }

  public add( node: QualityNode<T> ) {
    if ( this.head ) {
      node.next = this.head;
    } else {
      node.next = null;
    }
    this.head = node;
    this.length++;
  }
}
