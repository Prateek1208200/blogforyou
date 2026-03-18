package com.blog.controller;

import com.blog.model.Post;
import com.blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;

    // GET all posts (newest first)
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    // GET single post by ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new post (requires JWT)
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        post.setId(null); // ensure new record
        return ResponseEntity.ok(postRepository.save(post));
    }

    // PUT update post (requires JWT)
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post updated) {
        return postRepository.findById(id).map(post -> {
            post.setTitle(updated.getTitle());
            post.setContent(updated.getContent());
            post.setAuthor(updated.getAuthor());
            return ResponseEntity.ok(postRepository.save(post));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE post (requires JWT)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        postRepository.deleteById(id);
        return ResponseEntity.ok("Post deleted.");
    }
}
