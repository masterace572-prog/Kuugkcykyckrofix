< <?= $this->extend('Layout/Starter') ?>

<?= $this->section('content') ?>

            <br>
<div class="row justify-content-center">
    <div class="col-lg-6">
        <?= $this->include('Layout/msgStatus') ?>
        <?php if (session()->getFlashdata('user_key')) : ?>
            <div class="alert alert-success" role="alert">
                Key : <strong class="key-sensi"><?= session()->getFlashdata('user_key') ?></strong> ||         SLOT : <?= session()->getFlashdata('max_devices') ?> <br>
                Game : <?= session()->getFlashdata('game') ?>  || Days : <?= session()->getFlashdata('duration') ?> Hours<br>
                
                
                 </small>
            </div>
            
            KEY : <strong class=""><?= session()->getFlashdata('user_key') ?>      <i class="bi bi-clipboard" name="copy" id="copybtn" onclick="copyText()"></i></strong>
            <br>
 
    <style> 
        textarea {
            width: 0%;
            height: 0px;
            padding: 0x 0px;
            border: 0px solid #00000000; 
            border-radius: 0px;
            background-color: #00000000;
            font-size: 16px;
            resize: none;
        }
        </style>
            </head>
                <body>
                    <textarea type="" name="mytext" id="mytext"><?= session()->getFlashdata('user_key') ?></textarea>
                <script>
            function copyText() {
                var mytext = document.getElementById("mytext"); 
                mytext.select(); // Select Text Field
                document.execCommand("copy");  // Copy Text
                document.getElementById("msg").innerHTML = "";
            } 
        </script>    
    <style>
    // CSS
    .button-49,
    .button-49:after {
        width: 150px;
        height: 60px;
        text-align: center;
        line-height: 78px;
        font-size: 20px;
        font-family: 'Bebas Neue', sans-serif;
        background: linear-gradient(45deg, transparent 5%, #FF013C 5%);
        border: 0;
        color: #fff;
        letter-spacing: 3px;
        box-shadow: 6px 0px 0px #00E6F6;
        outline: transparent;
        position: relative;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .button-49:after {
        --slice-0: inset(50% 50% 50% 50%);
        --slice-1: inset(80% -6px 0 0);
        --slice-2: inset(50% -6px 30% 0);
        --slice-3: inset(10% -6px 85% 0);
        --slice-4: inset(40% -6px 43% 0);
        --slice-5: inset(80% -6px 5% 0);
  
        content: 'ALTERNATE TEXT';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 3%, #00E6F6 3%, #00E6F6 5%, #FF013C 5%);
        text-shadow: -3px -3px 0px #F8F005, 3px 3px 0px #00E6F6;
        clip-path: var(--slice-0);
    }

    .button-49:hover:after {
        animation: 1s glitch;
        animation-timing-function: steps(2, end);
    }

    @keyframes glitch {
        0% {
            clip-path: var(--slice-1);
            transform: translate(-20px, -10px);
        }
        10% {
            clip-path: var(--slice-3);
            transform: translate(10px, 10px);
        }
        20% {
            clip-path: var(--slice-1);
            transform: translate(-10px, 10px);
        }
        30% {
            clip-path: var(--slice-3);
            transform: translate(0px, 5px);
        }
        40% {
            clip-path: var(--slice-2);
            transform: translate(-5px, 0px);
        }
        50% {
            clip-path: var(--slice-3);
            transform: translate(5px, 0px);
        }
        60% {
            clip-path: var(--slice-4);
            transform: translate(5px, 10px);
        }
        70% {
            clip-path: var(--slice-2);
            transform: translate(-10px, 10px);
        }
        80% {
            clip-path: var(--slice-5);
            transform: translate(20px, -10px);
        }
        90% {
            clip-path: var(--slice-1);
            transform: translate(-10px, 0px);
        }
        100% {
            clip-path: var(--slice-1);
            transform: translate(0);
        }
    }

    @media (min-width: 768px) {
        .button-49,
        .button-49:after {
            width: 200px;
            height: 86px;
            line-height: 88px;
        }
    }
            
          // CSS
    .button-85 {
        padding: 0.6em 2em;
        border: none;
        outline: none;
        color: rgb(255, 255, 255);
        background: #111;
        cursor: pointer;
        position: relative;
        z-index: 0;
        border-radius: 10px;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .button-85:before {
        content: "";
        background: linear-gradient(
            45deg,
            #ff0000,
            #ff7300,
            #fffb00,
            #48ff00,
            #00ffd5,
            #002bff,
            #7a00ff,
            #ff00c8,
            #ff0000
        );
        position: absolute;
        top: -2px;
        left: -2px;
        background-size: 400%;
        z-index: -1;
        filter: blur(5px);
        -webkit-filter: blur(5px);
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        animation: glowing-button-85 20s linear infinite;
        transition: opacity 0.3s ease-in-out;
        border-radius: 10px;
    }

    @keyframes glowing-button-85 {
        0% {
            background-position: 0 0;
        }
        50% {
            background-position: 400% 0;
        }
        100% {
            background-position: 0 0;
        }
    }

    .button-85:after {
        z-index: -1;
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: #222;
        left: 0;
        top: 0;
        border-radius: 10px;
    }

    </style>
            
        <?php endif; ?>
        <div class="card">
               <div class=" shadow-lg p-3 mb-5 text-white" role="alert" style="background: linear-gradient(0.9turn, #1B1B1B, #1B1B1B, #1B1B1B);">
                <div class="row">
                    <div class="col pt-1">
                        Create License
                    </div>
                    <div class="col text-end">
                        <a class="btn btn-sm btn-outline-dark" href="<?= site_url('keys') ?>"><i class="bi bi-people"></i></a>
                    </div>
                </div>
            </div>
    <div class=" shadow-lg p-3 mb-5 text-dark" role="alert" style="background: linear-gradient(0.9turn, #FFFFFF, #FFFFFF, #FFFFFF);">
  
            <div class="card-body">
                <?= form_open() ?>

                <div class="row">
                    <div class="form-group col-lg-6 mb-3">
                        <label for="game" class="form-label">Game</label>
                        <?= form_dropdown(['class' => 'form-select', 'name' => 'game', 'id' => 'game'], $game, old('game') ?: '') ?>
                        <?php if ($validation->hasError('game')) : ?>
                            <small id="help-game" class="text-danger"><?= $validation->getError('game') ?></small>
                        <?php endif; ?>
                    </div>
                    <div class="form-group col-lg-6 mb-3">
                        <label for="max_devices" class="form-label">Max Devices</label>
                        
                        <input type="number" name="max_devices" id="max_devices" class="form-control" placeholder="1" value="<?= old('max_devices') ?: 1 ?>">
                        <?php if ($validation->hasError('game')) : ?>
                        
                        
                            <small id="help-max_devices" class="text-danger"><?= $validation->getError('max_devices') ?></small>
                        <?php endif; ?>
                    </div>
                </div>
                
                
                <div class="form-group mb-3">
                    <label for="duration" class="form-label">Duration</label>
                    <?= form_dropdown(['class' => 'form-select', 'name' => 'duration', 'id' => 'duration'], $duration, old('duration') ?: '') ?>
                    <?php if ($validation->hasError('duration')) : ?>
                        <small id="help-duration" class="text-danger"><?= $validation->getError('duration') ?></small>
                    <?php endif; ?>
                </div>
                <br>
  <label class="form-check-label" for="check">
    Custom Key
  </label>
<input class="form-check-input" type="checkbox" minlength="4" maxlength="16" value="" name="check" onchange="fupi(this)" id="check">
<br>


<br>
<label for="custom" id="cuslabel" class="form-label">Input Your Key</label>
    <input type="text" minlength="4" maxlength="16" name="cuslicense" class="form-control" id="custom"></input>
    
 <br>
  <label for="hulala" id="labula" class="form-label">Bulk Keys</label>         
  <select class="form-select" aria-label="Default select example" id="hulala" name="loopcount">

  <option value="5">1 Keys</option>
  <option value="1">5 Keys</option>
  <option value="2">10 Keys</option>
  <option value="3">25 Keys</option>
  <option value="3">50 Keys</option>
  <option value="4">100 Keys</option>
  

</select>

<br>
                
                  <input type="text" id="textinput" name="custominput" hidden>
                
                <div class="form-group mb-3">
                    <label for="estimation" class="form-label">Estimation</label>
                    <input type="text" id="estimation" class="form-control" placeholder="Your order will total" readonly>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-outline-dark">Generate</button>
                </div>
                <?= form_close() ?>

            </div>
        </div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('js') ?>
<script>
    $(document).ready(function() {
        var price = JSON.parse('<?= $price ?>');
        getPrice(price);
        // When selected
        $("#max_devices, #duration, #game").change(function() {
            getPrice(price);
        });
        // try to get price
        function getPrice(price) {
            var price = price;
            var device = $("#max_devices").val();
            var durate = $("#duration").val();
            var gprice = price[durate];
            if (gprice != NaN) {
                var result = (device * gprice);
                $("#estimation").val(result);
            } else {
                $("#estimation").val('Estimation error');
            }
        }
    });
function getOption() {
 var kop = document.getElementById('keysmode').value;

 
}
$(document).ready( function () {
  document.getElementById("custom").style.display = "none";
document.getElementById("cuslabel").style.display = "none";
});


function fupi(obj) {
  if($(obj).is(":checked")){
  //recommended W3C HTML5 syntax for boolean attributes


document.getElementById("custom").style.display = "block";
document.getElementById("cuslabel").style.display = "block";
 $('#hulala option').prop('selected', function() {
        return this.defaultSelected;
   });
document.getElementById("hulala").style.display = "none";
document.getElementById("labula").style.display = "none";
document.getElementById("textinput").value = "custom";
const input = document.getElementById('custom');
input.removeAttribute('required');
  }else{
document.getElementById("custom").style.display = "none";
document.getElementById("cuslabel").style.display = "none";
document.getElementById("hulala").style.display = "block";
document.getElementById("labula").style.display = "block";
document.getElementById("textinput").value = "auto";
const input = document.getElementById('custom');

// ✅ Set required attribute
//input.setAttribute('required', '');

// ✅ Remove required attribute
// 
  }
  
}
</script>
<?= $this->endSection() ?>