import { Component, OnInit } from '@angular/core';
import {Message} from '../message';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

@Component({
  selector: 'app-feedback-field',
  templateUrl: './feedback-field.component.html',
  styleUrls: ['./feedback-field.component.less']
})
export class FeedbackFieldComponent implements OnInit {
  messageCollection: AngularFirestoreCollection<Message>;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.messageCollection = this.afs.collection('messages');
  }

  send(descr: string) {
    if (descr !== '') {
      const message: Message = {descr, date: new Date().toUTCString()};
      // Hack to allow sending custom classes to Firestore
      this.messageCollection.add(JSON.parse(JSON.stringify(message)));
    }
  }

}
