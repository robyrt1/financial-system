import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import amqp, { Channel, ChannelModel } from "amqplib";
import { EventPublisherPort } from "@domain/ports/out/event-publisher.port";

@Injectable()
export class RabbitMqPublisherAdapter
  implements EventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private connection?: ChannelModel;
  private channel?: Channel;
  private readonly exchangeName = "financial.events";

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>(
      "RABBITMQ_URL",
      "amqp://localhost:5672",
    );
    try {
      const connection = await amqp.connect(url);
      const channel = await connection.createChannel();
      await channel.assertExchange(this.exchangeName, "topic", {
        durable: true,
      });

      this.connection = connection;
      this.channel = channel;
    } catch (err) {
      console.error("Failed to connect to RabbitMQ in financial-service:", err);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(routingKey: string, payload: unknown): Promise<void> {
    if (!this.channel) {
      console.warn(
        "RabbitMQ channel not initialized. Event skipped:",
        routingKey,
      );
      return;
    }
    this.channel.publish(
      this.exchangeName,
      `financial.${routingKey}`,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, contentType: "application/json" },
    );
  }
}
