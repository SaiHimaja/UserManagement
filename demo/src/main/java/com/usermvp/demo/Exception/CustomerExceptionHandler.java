package com.usermvp.demo.Exception;

import com.usermvp.demo.Exception.BadRequestException;

import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;

@ControllerAdvice
public class CustomerExceptionHandler {
    
    @GraphQlExceptionHandler(BadRequestException.class)
     public GraphQLError handleBadRequestException(BadRequestException ex) {
          // ✅ LOG THE ERROR
          System.out.println("❌ BadRequestException caught: " + ex.getMessage());

        return GraphqlErrorBuilder.newError()
                .message(ex.getMessage())  // Send the actual error message
                .build();
    }
}
