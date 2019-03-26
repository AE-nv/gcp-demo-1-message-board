import { Component, OnInit } from '@angular/core';
import {Message} from '../message';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.less']
})
export class MessageListComponent implements OnInit {
  messagesCollection: AngularFirestoreCollection<Message>;
  messages: Observable<Message[]>;
  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.messagesCollection = this.afs.collection('messages', ref => ref.orderBy('date', 'desc').limit(20));
    this.messages = this.messagesCollection.valueChanges();
  }

}
