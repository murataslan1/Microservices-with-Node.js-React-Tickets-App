import { Publisher,Subjects, ExpirationCompleteEvent } from "@tickets_dl/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;


}