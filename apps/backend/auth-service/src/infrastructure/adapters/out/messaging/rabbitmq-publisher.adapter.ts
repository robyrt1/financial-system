import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { Channel, ChannelModel } from 'amqplib';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { UserRegisteredEvent } from '@domain/events/user-registered.event';

@Injectable()
export class RabbitMqPublisherAdapter implements EventPublisherPort, OnModuleInit, OnModuleDestroy {
    private connection?: ChannelModel;
    private channel?: Channel;
    private readonly exchangeName = 'financial.events';

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        await channel.assertExchange(this.exchangeName, 'topic', { durable: true });

        this.connection = connection;
        this.channel = channel;
    }

    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }

    async publishUserRegistered(event: UserRegisteredEvent): Promise<void> {
        if (!this.channel) return;
        this.channel.publish(
            this.exchangeName,
            'auth.user.registered',
            Buffer.from(JSON.stringify(event.toJSON())),
            { persistent: true, contentType: 'application/json' },
        );
    }
}