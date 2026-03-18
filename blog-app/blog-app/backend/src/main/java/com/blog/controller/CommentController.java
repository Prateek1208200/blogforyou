package com.blog.controller;

import com.blog.model.Comment;
import com.blog.repository.CommentRepository;
import com.blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    // GET all comments for a post
    @GetMapping("/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(commentRepository.findByPostIdOrderByCreatedAtAsc(postId));
    }

    // POST add comment to a post (requires JWT)
    @PostMapping("/{postId}")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId,
                                               @RequestBody Comment comment) {
        return postRepository.findById(postId).map(post -> {
            comment.setId(null);
            comment.setPost(post);
            return ResponseEntity.ok(commentRepository.save(comment));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE a comment (requires JWT)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepository.deleteById(id);
        return ResponseEntity.ok("Comment deleted.");
    }
}
