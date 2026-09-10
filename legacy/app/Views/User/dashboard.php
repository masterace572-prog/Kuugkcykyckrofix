<?= $this->extend('Layout/Starter') ?>

<?= $this->section('content') ?>


<style>
      background: linear-gradient(0.97turn, #e3393988, #2a2225, #622f2f);
  </style>

<?= $this->include('Layout/msgStatus') ?>
<div class="row">
<div class="col-lg-6">
<div class="card mb-3">
       
  <div class=" shadow-lg p-3 mb-5 text-dark" role="alert" style="background: linear-gradient(0.9turn, #FFFFFF, #FFFFFF, #FFFFFF);">
<div class="dash-count">
<div class="dash-counts">
<h4>Total Keys</h4>
<h5 class="bi bi-person"><?= $keysAll ?></h5>
</div>






<div class="col-lg-6">
        <div class="card mb-3">
                                       <div class=" shadow-lg p-3 mb-5 text-dark" role="alert" style="background: linear-gradient(0.9turn, #FFFFFF, #FFFFFF, #FFFFFF);">

<div class="dash-count">
<div class="dash-counts">
<h4>Sold Keys</h4>
<h5 class="bi bi-person"><?= $usedKeys ?></h5>
</div>







<div class="col-lg-6">
        <div class="card mb-3">
                        <div class=" shadow-lg p-3 mb-5 text-dark" role="alert" style="background: linear-gradient(0.9turn, #FFFFFF, #FFFFFF, #FFFFFF);">
    
<div class="dash-count">
<div class="dash-counts">
<h4>Unused Key</h4>
<h5 class="bi bi-person"><?= $unusedKeys ?></h5>
</div>






<div class="col-lg-6">
        <div class="card mb-3">
                <div class=" shadow-lg p-3 mb-5 text-dark" role="alert" style="background: linear-gradient(0.9turn, #FFFFFF, #FFFFFF, #FFFFFF);">
          
<div class="dash-count">
<div class="dash-counts">
<h4>Total Users</h4>
<h5 class="bi bi-person"><?= $userAll ?></h5>
</div>


<li class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">USER IP<span class="badge text-success"><? echo $_SERVER['REMOTE_ADDR']; ?></span></li>





                
                <?= $this->endSection() ?>
