<header>
   <nav class="navbar navbar-dark" style="background-image: linear-gradient(0.9turn, #1B1B1B, #1B1B1B, #1B1B1B); shadow-sm align-middle">
        <div class="container px-3">
            <a class="navbar-brand" href="<?= site_url() ?>"><i class="bi bi-triangle"></i><?= BASE_NAME ?></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <?php if (session()->has('userid')) : ?>
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link text-white " href="<?= site_url(' keys') ?>">  Keys</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white " href="<?= site_url('keys/generate') ?>">  Generate</a>
                        </li>

                        <li class="nav-item">
                            <a class="nav-link text-white " href="<?= site_url('Profile') ?>">  Profile Info</a>
                        </li>

                    </ul>
                    <div class="float-right">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class=""></i><?= getName($user) ?>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-lg-start" aria-labelledby="navbarDropdown">
                                  
                                   
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <?php if ($user->level == 1) : ?>
                                        <li class="dropdown-item text-muted">Admin</li>
                                        
                                          <li>
                                        <a class="dropdown-item" href="<?= site_url('Server') ?>">
                                            <i class="""></i>  Online Server
                                        </a>
                                         </li>
                                        <li>
                                            <a class="dropdown-item" href="<?= site_url('admin/manage-users') ?>">
                                                <i class=""></i> Manage Users
                                            </a>
                                        </li>
                                        <li>
                                            <a class="dropdown-item" href="<?= site_url('admin/create-referral') ?>">
                                                <i class=""></i> Create Referral
                                            </a>
                                        </li>
              

                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                    <?php endif; ?>
                                    <li>
                                        <a class="dropdown-item text-danger" href="<?= site_url('logout') ?>">
                                            <i class=""></i> Logout
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
            </div>
        <?php endif; ?>

        </div>
    </nav>
</header>