<template>
    <div class="home">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="jumbotron bg-primary text-white p-5 rounded">
                        <h1 class="display-4">Hệ Thống Quản Lý Mượn Sách</h1>
                        <p class="lead">Chào mừng bạn đến với hệ thống quản lý mượn sách hiện đại</p>
                        <router-link to="/login" class="btn btn-light btn-lg">Đăng nhập</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Home page component
</script>

<style scoped>
.jumbotron {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>