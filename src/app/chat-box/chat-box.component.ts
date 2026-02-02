import { Component } from '@angular/core';
import {Message} from './chat-box.model';
import {ChatService} from './chat-box.service';
import {AuthService} from '../auth/auth.service';
import {User} from '../users/users.model';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  imports: [
    FormsModule,
    NgClass,
    DatePipe,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent {
  isOpen = false;
  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    // Add user message
    const userMessage: Message = {
      content: this.userInput,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMessage);

    const messageText = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    // Call API
    this.chatService.sendMessage({userId: this.currentUser?.id, message: messageText}).subscribe({
      next: (response) => {
        const aiMessage: Message = {
          content: response.response,
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(aiMessage);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error:', error);
        const errorMessage: Message = {
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-messages');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 100);
  }
}
