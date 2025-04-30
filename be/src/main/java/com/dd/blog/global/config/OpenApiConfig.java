package com.dd.blog.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        Server server = new Server();
        server.setUrl("https://api.blog.braincleaner.site");
        server.setDescription("Production Server");

        return new OpenAPI()
                .info(new Info().title("BrainCleaner API").version("v1"))
                .servers(List.of(server));
    }
}
